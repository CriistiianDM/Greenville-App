import React, { useReducer, useContext, useCallback } from 'react';
import API from '../api';

const initialState = {
  houses: [],
  houseSelected: null,
};

const HouseStateContext = React.createContext();
const HouseDispatchContext = React.createContext();

function HouseReducer(state, { type, houses, houseSelected, house }) {
  console.log('=======HOUSE REDUCER=======');
  switch (type) {
    case 'houses': {
      console.log(`Houses: `, houses);
      return { ...state, houses };
    }
    case 'select': {
      console.log(`House Selected: `, houseSelected);
      return { ...state, houseSelected };
    }
    case 'update': {
      console.log(`Update House: `, house);
      const houseIndex = state.houses.findIndex(
        h => h.idHouse === house.idHouse
      );
      const isHouseSelected = state.houseSelected
        ? state.houseSelected.idHouse === house.idHouse
        : null;
      if (houseIndex === -1) return state;
      const newHouses = [...state.houses];
      newHouses[houseIndex] = { ...newHouses[houseIndex], ...house };
      return {
        ...state,
        houses: newHouses,
        houseSelected: isHouseSelected
          ? { ...state.houseSelected, ...house }
          : state.houseSelected,
      };
    }
    case 'add': {
      console.log(`Add House: `, house);
      return {
        ...state,
        houses: [...state.houses, house],
      };
    }
    case 'remove': {
      console.log(`Remove House: `, house);
      return {
        ...state,
        houses: state.houses.filter(i => i !== house),
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
}

function HouseContext({ children }) {
  const [state, dispatch] = useReducer(HouseReducer, initialState);

  const setHouses = useCallback(
    houses => dispatch({ type: 'houses', houses }),
    []
  );

  const setHouseSelected = useCallback(async houseSelected => {
    console.log('==== SETTING HOUSE SELECTED ====');
    dispatch({ type: 'select', houseSelected });
    const houseWithFiles = await API.getHouseFiles(houseSelected);
    dispatch({ type: 'update', house: houseWithFiles });
    console.log('==== END SETTING HOUSE SELECTED ====');
  }, []);

  const getHouseSelected = useCallback(
    () => dispatch({ type: 'get-select' }),
    []
  );

  const getHouseFolder = useCallback(async ({ house, files = [] }) => {
    console.log('==== GETTING HOUSE FOLDER ====');
    const { idHouse, zone, address , idHr, lastName , builder } = house;
   
    let houseFolder = '';
    if (files.length) {
      const fileFromDrive = await API.uplaodFilesGroups({
        zone,
        houseFiles: files,
        idHouse:`${idHr} / ${lastName} / ${address} |${house.files}`,
      });
      houseFolder = fileFromDrive.folder;
    } else {
      houseFolder = house.files || '';
    }
    console.log('==== END GETTING HOUSE FOLDER ====');
    return houseFolder;
  }, []);

  const addHouse = useCallback(async ({ house, files }) => {
    console.log('==== CREATING HOUSE ====');
    const { ok, data } = await API.createHouse(JSON.stringify(house));
    console.log(`Response Data: `, data);
    if (!ok) return { error: data };
    const houseFolder = await getHouseFolder({ house: data, files });
   
    const { idHouse } = data;
    const description = 'House Created';
    const status = 'INITIAL';
    data.status = status;
    const { data: comment } = await API.createComment(
      JSON.stringify({ idHouse, description, status })
    );
    const commentFolder = '';
    data.comments = [{ ...comment, files: commentFolder }];
    const newHouse = { ...data, files: houseFolder };
    await API.updateHouse(JSON.stringify(newHouse));

    dispatch({ type: 'add', house: newHouse });
    console.log('==== END CREATING HOUSE ====');
    return newHouse;
  }, []);

  const updateHouse = useCallback(async ({ files, house }) => {
    console.log('==== UPDATING HOUSE ====');
    const houseFolder = await getHouseFolder({ house, files });
    const newHouse = { ...house, files: houseFolder };
    await API.updateHouse(JSON.stringify(newHouse));
    dispatch({ type: 'update', house: newHouse });
    console.log('==== END UPDATING HOUSE ====');
  }, []);

  const removeHouse = useCallback(
    house => dispatch({ type: 'remove', house }),
    []
  );

  return (
    <HouseStateContext.Provider value={state}>
      <HouseDispatchContext.Provider
        value={{
          setHouses,
          addHouse,
          removeHouse,
          updateHouse,
          getHouseSelected,
          setHouseSelected,
        }}
      >
        {children}
      </HouseDispatchContext.Provider>
    </HouseStateContext.Provider>
  );
}

function withBreadcrumbDispatch(Component) {
  return function WrapperComponent(props) {
    return (
      <HouseDispatchContext.Consumer>
        {dispatchProps => <Component {...{ ...props, ...dispatchProps }} />}
      </HouseDispatchContext.Consumer>
    );
  };
}

function useHouseState() {
  const context = useContext(HouseStateContext);
  if (context === undefined) {
    throw new Error(
      'House state Context must be used within an House Provider'
    );
  }
  return context;
}

function useHouseDispatch() {
  const context = React.useContext(HouseDispatchContext);
  if (context === undefined) {
    throw new Error(
      'House dispatch Context must be used within a House Provider'
    );
  }
  return context;
}

function useHouse() {
  return [useHouseState(), useHouseDispatch()];
}

export {
  HouseContext,
  useHouse,
  withBreadcrumbDispatch,
  useHouseState,
  useHouseDispatch,
  HouseDispatchContext,
};

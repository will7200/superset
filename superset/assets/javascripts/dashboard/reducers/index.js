const up =  (state = { drillLinks: []},action) => {
    switch(action.type){
        case 'SERIALIZE_DASHBOARD':
            return {
                ...state,
                serialize: true
            }
        case 'UPDATE_DRILL':
            state.drillLinks[action.sliceId] = action.value
            return {
              ...state
            }
        case 'UPDATE_OBJECT':
            return {
              ...state,
              update: true
            }
        default:
            return state
    }
}

export default up

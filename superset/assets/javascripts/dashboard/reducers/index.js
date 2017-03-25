const up =  (state = { drillLinks: []},action) => {
    switch(action.type){
        case 'SERIALIZE_DASHBOARD':
            return {
                ...state,
                serialize: true
            }
        case 'UPDATE_DRILL':
            drillLinks[action.sliceId] = action.value
            return {
              ...state
            }
        default:
            return state
    }
}

export default up

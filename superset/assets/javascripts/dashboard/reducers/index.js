const up =  (state = { drillLinks: []},action) => {
    switch(action.type){
        case 'SERIALIZE_DASHBOARD':
            return {
                ...state,
                serialize: true
            }
        default:
            return state
    }
}

export default up

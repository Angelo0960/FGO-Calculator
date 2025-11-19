const List = ({listOfNames}) => {
    return (
        <>

        <ul>
            {listOfNames && listOfNames.map((servants, index) => 
                <li key={index}>{servants}</li>
            )}
        </ul>
        
        
        </>
)}

export default List

import { useState } from "react";
import Button from "./Button";
import List from "./List";

const Forms = (props) => {
  const [formData, setFormData] = useState('Servant Name');
  const [listOfNames, setListOfNames] = useState([]);   

  const handleSubmit = (e) => {
    e.preventDefault();


    const servants = formData;
    setListOfNames([...listOfNames, servants]);
    console.log(listOfNames);
  }
    return (
        <>
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="formData" className="text-3xl">
                        <input 
                        className="border rounded-4xl p-4"
                        type="text" 
                        placeholder={formData}
                        name="servantName"
                        onChange={(e)=> setFormData(e.target.value)}
                        />
                    </label>
                </div>
                <Button type="submit"/>
              
              
            </form>
            <List listOfNames={listOfNames}/>
      </div>
        
      </>
    )
}

export default Forms;
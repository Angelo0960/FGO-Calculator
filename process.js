const ul = document.querySelector('#bookList','#studentList');


const getData = async () => {
    const response = await fetch ('http://localhost:3000/books/all');
    const data = await response.json();

    return data;
}
const getStudent = async () => {
    const response = await fetch ('http://localhost:3000/students/all');
    const data = await response.json();

    return data;
}

getData().then((data) => {
    const books = data.message;
    
    
    books.forEach(book => {
        const div = document.createElement('div');
        div.classList.add('max-w-sm','p-6','rounded-lg','shadow-sm','hover:bg-gray-100','dark:bg-gray-800','dark:border-gray-700','dark:hover:bg-gray-700');
       div.innerText = book.title
       ;
        
       ul.append(div);
        
    });
    
})

getStudent().then((data) => {   
    const students = data.message;

    students.forEach(student => {
        const div = document.createElement('div');
        div.classList.add('max-w-sm','p-6','rounded-lg','shadow-sm','hover:bg-gray-100','dark:bg-gray-800','dark:border-gray-700','dark:hover:bg-gray-700');
       div.innerText = student.Name;
       
        ul.appendChild (div);
        
        
    });
    
})


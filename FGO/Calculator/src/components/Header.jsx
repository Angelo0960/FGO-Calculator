const Header = ({name}) => {
    return(
        <>
        <div className="bg-white box-shadow-lg p-10 m-10 rounded-4xl  border-t-2 border-t-gray-200 space-x-4 shadow-lg shadow-gray-200 text-center ">
        <img src="../src/images/Fate_Grand_Order_logo.png" alt="fgo_logo.png" className="h-20 w-50 ml-145" />
        <h1 className="font-bold text-4xl text-black font-serif">Material Calculator</h1>
        <p>Plan your servant upgrades and track the materials you need</p>
        <h3 className="font-extrabold text-4xl text-black text-right font-serif ">Hello {name}</h3>
        </div>
        </>
    )
}

export default Header
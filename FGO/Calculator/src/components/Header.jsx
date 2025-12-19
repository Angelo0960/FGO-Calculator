const Header = ({ name }) => {
  return (
    <header className="relative overflow-hidden">

      {/* Main Content */}
      <div className="relative bg-card/80 backdrop-blur-sm border-0 border-gray-300 mb-2 rounded-b-3xl p-6 md:p-10 shadow-xl bg-blue-800">
        <div className="max-w-7xl mx-auto">
          {/* Logo and Title */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl  from-primary to-secondary p-0.5">
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <img 
  src="../src/images/Fate_Grand_Order_logo.png" 
  alt="Fate/Grand Order Logo" 
  className="w-28 h-28 md:w-36 md:h-36 object-contain"
/>

                  </div>
                </div>
                
              </div>
              
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1">
                  Material Calculator
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Plan your servant upgrades and track the materials you need
                </p>
              </div>
            </div>

            {/* User Greeting */}
            {name && (
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Welcome back,</p>
                    <p className="font-semibold text-foreground">{name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          

          
        </div>
      </div>
    </header>
  );
};

export default Header;
const List = ({ listOfNames }) => {
  if (!listOfNames || listOfNames.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-card/50 rounded-lg border border-border">
        <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-muted-foreground">No items to display</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Servants List ({listOfNames.length})
        </h3>
      </div>
      <ul className="divide-y divide-border max-h-96 overflow-y-auto">
        {listOfNames.map((servant, index) => (
          <li 
            key={index} 
            className="px-4 py-3 hover:bg-muted/30 transition-colors duration-150 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">{index + 1}</span>
              </div>
              <span className="text-foreground font-medium flex-1">{servant}</span>
              <button 
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                onClick={() => console.log('Edit', servant)}
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        Click on a servant to edit or view details
      </div>
    </div>
  );
};

export default List;
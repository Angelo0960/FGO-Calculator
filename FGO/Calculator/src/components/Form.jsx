import { useState } from "react";
import Button from "./Button";
import List from "./List";
import Icon from "./AppIcon";

const Forms = (props) => {
  const [formData, setFormData] = useState('');
  const [listOfNames, setListOfNames] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const servants = formData.trim();
      setListOfNames([...listOfNames, servants]);
      setFormData('');
      setIsSubmitting(false);
    }, 500);
  };

  const handleClearAll = () => {
    setListOfNames([]);
  };

  const handleRemoveServant = (index) => {
    const newList = listOfNames.filter((_, i) => i !== index);
    setListOfNames(newList);
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="PlusCircle" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Add Servant</h2>
            <p className="text-sm text-muted-foreground">Enter servant name to add to your list</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="servantName" className="text-sm font-medium text-foreground">
              Servant Name
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Icon name="Search" size={20} className="text-muted-foreground" />
              </div>
              <input
                id="servantName"
                type="text"
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                placeholder="e.g., Artoria Pendragon, Gilgamesh..."
                className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            {formData && (
              <p className="text-xs text-muted-foreground">
                Press Enter or click Add to add "{formData}" to your list
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!formData.trim() || isSubmitting}
              loading={isSubmitting}
              className="flex-1"
              iconName={isSubmitting ? "Loader" : "Plus"}
              iconPosition="left"
            >
              {isSubmitting ? 'Adding...' : 'Add Servant'}
            </Button>
            
            {listOfNames.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                className="flex-1"
                iconName="Trash2"
                iconPosition="left"
              >
                Clear All
              </Button>
            )}
          </div>
        </form>

        {/* Quick Suggestions */}
        {listOfNames.length === 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Popular Servants:</p>
            <div className="flex flex-wrap gap-2">
              {['Artoria', 'Gilgamesh', 'Jeanne', 'Scáthach', 'Merlin', 'Skadi'].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData(name)}
                  className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Icon name="User" size={14} />
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Card */}
      {listOfNames.length > 0 && (
        <div className="bg-card/50 rounded-lg border border-border p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{listOfNames.length}</div>
              <div className="text-xs text-muted-foreground">Total Servants</div>
            </div>
            <div className="text-center p-3 bg-secondary/5 rounded-lg">
              <div className="text-2xl font-bold text-secondary">0</div>
              <div className="text-xs text-muted-foreground">Ready to Upgrade</div>
            </div>
            <div className="text-center p-3 bg-green-500/5 rounded-lg">
              <div className="text-2xl font-bold text-green-500">0</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-amber-500/5 rounded-lg">
              <div className="text-2xl font-bold text-amber-500">{listOfNames.length}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Servants List */}
      <List 
        listOfNames={listOfNames}
        onRemove={handleRemoveServant}
      />

      {/* Empty State */}
      {listOfNames.length === 0 && (
        <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-dashed border-primary/30 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Users" size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Servants Added Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding servants to create your upgrade plan
          </p>
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setFormData('Artoria Pendragon')}
              variant="outline"
              iconName="UserPlus"
              iconPosition="left"
            >
              Add Example
            </Button>
            <Button
              onClick={() => setListOfNames(['Artoria', 'Gilgamesh', 'Jeanne'])}
              variant="default"
              iconName="Users"
              iconPosition="left"
            >
              Add Sample List
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms;
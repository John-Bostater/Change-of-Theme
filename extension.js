/*
[Author]: John Bostater

[Creation Date]: 5/16/26

[Description]:
    Randomize the theme to whatever
*/


//[Variables/Reqs]
//---------------------------------
  const vscode = require('vscode');
//---------------------------------


//[System Functions]
//--------------------------------------------------------------------------------------------

  //[Runs upon Activation of the Extension]
    function activate(context) {

      //Register the Extension to the tree
        vscode.window.registerTreeDataProvider( "changeOfTheme", new ThemeChanger() );

      //Push events to subscribers of action-event handlers
        context.subscriptions.push(

          //[Dark Mode Command Registry]
            vscode.commands.registerCommand("darkMode", (item) => {


              //DEBUG/VS CODE WINDOW DISPLAY
                vscode.window.showInformationMessage("Running Function for: " + item.label);

            })
        );
    }

//--------------------------------------------------------------------------------------------


//[Classes/Objects]
//--------------------------------------------------------------------------------------------


  //[Theme Changer]
    class ThemeChanger {

      //Constructor
        constructor(){
        
          //Action-Event Handlers for the press of the buttons
            this._onDidChangeTreeData = new vscode.EventEmitter();
            this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        }

      //Fire functions selected upon refresh
        refresh(){ this._onDidChangeTreeData.fire(); }

      //Return the item
        getTreeItem(element){ return element; }


      //[Displayed Objects/Classes]
        getChildren() {

          //List of "Buttons" for the extension
            return [

              //[Any Random Theme]
                new Button("Any Random Theme", "Click to Run", "darkMode"),

              //[Any Random Dark Theme]
                new Button("Random Dark Theme", "", "darkMode"),

              //[Any Random Light Theme]
                new Button("Random Light Theme", "", "darkMode"),

            ];
        }
    }


  //[Button]
    class Button extends vscode.TreeItem {


      //Constructor
        constructor(buttonName, description, commandId) {

          //Calls parent
            super(buttonName, vscode.TreeItemCollapsibleState.None);


          //Button Behavour
            this.command = {
                command: commandId,
                title: buttonName,
                arguments: [this]
            };

          //Button Description
            this.description = description;


//[TO DO]
//(find other icons to differentiate buttons? or use emojis)

          //Set up the icon for the button 
            this.iconPath = new vscode.ThemeIcon("sparkle");
        }
    }

//--------------------------------------------------------------------------------------------


//[Export functions]
//------------------------------
  module.exports = { activate };
//------------------------------
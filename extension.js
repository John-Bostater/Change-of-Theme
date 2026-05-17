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


              //Inform the user of their choice
                vscode.window.showInformationMessage("Random Dark Theme Applied!");

            }),


          //[Light Mode Command Registry]
            vscode.commands.registerCommand("lightMode", (item) => {


              //Inform the user of their choice
                vscode.window.showInformationMessage("Random Light Theme Applied!");

            }),


          //[Any Theme Mode Command Registry]
            vscode.commands.registerCommand("anyMode", (item) => {

              //Inform the user of their choice
                vscode.window.showInformationMessage("Any Random Theme Applied!");

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
                new Button("Any Random Theme", "Click to Run", "anyMode"),

              //[Any Random Dark Theme]
                new Button("Random Dark Theme", "Click to Run", "darkMode"),

              //[Any Random Light Theme]
                new Button("Random Light Theme", "Click to Run", "lightMode"),

            ];
        }
    }


  //[Button]
    class Button extends vscode.TreeItem {


      //Constructor
        constructor(buttonName, buttonDescription, commandId) {

          //Calls parent
            super(buttonName, vscode.TreeItemCollapsibleState.None);


          //Button Behavour
            this.command = {
                command: commandId,
                title: buttonName,
                arguments: [this]
            };

          //Button Description
            this.description = buttonDescription;


          //Set up the icon for the button based on which type it is
          //===============================================================================================

            //[Light Theme]
              if(buttonName == "Random Light Theme"){ this.iconPath = new vscode.ThemeIcon("sparkle"); }

            //[Dark Theme]
              else if(buttonName == "Random Dark Theme"){ this.iconPath = new vscode.ThemeIcon("circle"); }

            //[Any Random Theme]
              else if(buttonName == "Any Random Theme"){ this.iconPath = new vscode.ThemeIcon("wand"); }

          //===============================================================================================

        }
    }

//--------------------------------------------------------------------------------------------


//[Export functions]
//------------------------------
  module.exports = { activate };
//------------------------------
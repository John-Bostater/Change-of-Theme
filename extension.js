/*
[Author]: John Bostater

[Creation Date]: 5/16/26

[Description]:
    Randomize the theme to whatever


[TO DO!!]

  -  Have three arrays containing themes:  allThemes, lightThemes, darkThemes

  -  Allow user's the option to set a "Default theme" that they can quickly apply with a button

  -  Allow user's the option to randomly switch themes on a timer (a feat that similar extensions have)

*/


//[Global]
//----------------------------------------

  //Reqs
    const vscode = require('vscode');
    const os = require('os');
    const path = require('path');

  //Variables
    var userName = os.userInfo().username;

//----------------------------------------


//[Allocations before Activation]
//---------------------------------------------------------------------------


  //Find the .json file that contains all of the default themes 
  //    Search the directories past:    "C:\Users\<NAME>\AppData\Local\Programs\Microsoft VS Code\<directory>"
  //      We are doing this to see if they contain:   "<directory>\resources\app\extensions\theme-defaults\package.json" 
  //
  //  There could also NOT be a directory between the two, so account for that too!
  //
  //    a lot of   path.exist()   coming up im sure
  //
    //Code here..


  //Load the .json data from the dump 
  //  maybe just gather the array of theme name's directly from:   ["contributes"]["themes"][INDEX OF THEME]["label"]
    //Code here..


//---------------------------------------------------------------------------


//[System Function]
//--------------------------------------------------------------------------------------------

  //[Runs upon Activation of the Extension]
    function activate(context) {


      //Register the Extension to the tree
        vscode.window.registerTreeDataProvider( "changeOfTheme", new ThemeChanger() );


      //Push events to subscribers of action-event handlers
        context.subscriptions.push(

          //[Dark Mode Command Registry]
            vscode.commands.registerCommand("darkMode", (item) => {


//[TO DO!!]
//  Do this for the other branches below too

              //Randomly Generate a number between:  0  and  Length(darkThemeArray)-1 
                //Code here...

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


//[Other Functions]
//--------------------------------------------------------------------------------------------


//[TO DO!!]
//  FINISH THIS FUNCTION

  //Randomly generate a number between 0  & the number given
  //  this will be the index of our theme
    function GenerateRandomNumber(randNumRange){ return 0; }



//[TO DO!!]
//  FINISH THIS FUNCTION

  //Collect all of the themes either:    [Dark] : True    or    [Light] : False
    function GenerateRandomNumber(themeType){ return 0; }

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
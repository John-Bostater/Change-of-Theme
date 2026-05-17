/*
[Author]: John Bostater

[Creation Date]: 5/16/26


[Description]:
  Randomize the theme to the user's specifications.


[TO DO!!]

  -  Create an icon for this extension!

  -  Make sure randomized theme to be applied is not the same as the current one

*/


//[Global]
//----------------------------------------

  //Reqs
    const vscode = require('vscode');
    const os = require('os');
    const path = require('path');
    const fs = require('fs');

  //Variables
    var userName = os.userInfo().username;

  //Arrays
    var allThemeNames = [];
    var darkThemeNames = [];
    var lightThemeNames = [];

//----------------------------------------


//[Allocations before Activation]
//-----------------------------------------------------------------------------------------------------------------------------


  //See if the user's Directory leading up to mystery one exists
    const leadDir = path.join("C:", "Users", userName, "AppData", "Local", "Programs", "Microsoft VS Code")

  //Reference to the directory containing the default themes json
    var followDir = path.join("resources", "app", "extensions", "theme-defaults", "package.json");


  //[Lead directory DNE] activate flag
    if(!fs.existsSync(leadDir)){ MissingFileWarning("[ERROR]: VS Code Directory not found - {Change of Theme}"); return; }


  //Reference to the complete path of the directory
    var completePath = path.join(leadDir, followDir);


  //Gather all of the directories past the lead (we will try a combo of paths until we come across the one we need)
    const searchDirectories = fs.readdirSync(leadDir, {withFileTypes: true} );


  //Parse every dir within the [searchDirectories]
  //  Try combinations until we find the path we need
    for(const parsedDir of searchDirectories){

      //Check if the complete path is found
        if(fs.existsSync(completePath)){ console.log("Path Found!!"); break; }


      //Proceed to creating the file parsed is a folder
        else if(parsedDir.isDirectory()){ completePath = path.join(leadDir, parsedDir.name, followDir); }

    }

  //Path still DNE, return
    if(!fs.existsSync(completePath)){ MissingFileWarning("[Error]: Default Theme DIR was never found - {Change of Theme}"); return;}


  //Load the .json data from the dump 
  //  maybe just gather the array of theme names directly from:   ["contributes"]["themes"][INDEX OF THEME]["label"]
    
  //Gather the JSON data
    const rawTxt = fs.readFileSync(completePath, "utf-8")
    const jsonData = JSON.parse(rawTxt);


  //For the length of the entire array, collect all names
    for(i=0; i < jsonData["contributes"]["themes"].length; i++){

      //Gather the name of every theme and place it into our array
        allThemeNames.push(jsonData["contributes"]["themes"][i]["id"]);

    }

  //Collect the Dark & Light Arrays
    GetThemesByType(true); GetThemesByType(false);

//-----------------------------------------------------------------------------------------------------------------------------


//[System Function]
//-----------------------------------------------------------------------------------------------------------------------------

  //[Runs upon Activation of the Extension]
    function activate(context) {


      //Register the Extension to the tree
        vscode.window.registerTreeDataProvider( "changeOfTheme", new ThemeChanger() );


      //Push events to subscribers of action-event handlers
        context.subscriptions.push(

          //[Dark Mode Command Registry]
            vscode.commands.registerCommand("darkMode", (item) => {

              //Select a theme & gather the name from the respective array
                const randNumber = GenerateRandomNumber(darkThemeNames.length);
                newName = darkThemeNames[randNumber];

              //Function to apply the new theme to the user's settings json
                appliedTheme = ApplyNewTheme(newName);


              //If the function returns false, try again with a new random number
                if(!appliedTheme){ newName = darkThemeNames[GenerateRandomNumber(darkThemeNames.length)]; ApplyNewTheme(newName); }


              //Inform the user of their choice
                vscode.window.showInformationMessage(`Random [Dark] Theme Applied! [${newName}]`);

            }),


          //[Light Mode Command Registry]
            vscode.commands.registerCommand("lightMode", (item) => {

              //Select a theme & gather the name from the respective array
                const randNumber = GenerateRandomNumber(lightThemeNames.length);
                newName = lightThemeNames[randNumber];

              //Function to apply the new theme to the user's settings json
                appliedTheme = ApplyNewTheme(newName);


              //If the function returns false, try again with a new random number
                if(!appliedTheme){ newName = lightThemeNames[GenerateRandomNumber(lightThemeNames.length)]; ApplyNewTheme(newName); }


              //Inform the user of their choice
                vscode.window.showInformationMessage(`Random [Light] Theme Applied! [${newName}]`);

            }),


          //[Any Theme Mode Command Registry]
            vscode.commands.registerCommand("anyMode", (item) => {

              //Select a theme & gather the name from the respective array
                const randNumber = GenerateRandomNumber(allThemeNames.length);
                newName = allThemeNames[randNumber];

              //Function to apply the new theme to the user's settings json
                appliedTheme = ApplyNewTheme(newName);


              //If the function returns false, try again with a new random number
                if(!appliedTheme){ newName = allThemeNames[GenerateRandomNumber(allThemeNames.length)]; ApplyNewTheme(newName); }


              //Inform the user of their choice
                vscode.window.showInformationMessage(`Random [All] Theme Applied! [${newName}]`);

            })

        );
    }

//-----------------------------------------------------------------------------------------------------------------------------


//[Other Functions]
//-----------------------------------------------------------------------------------------------------------------------------


  //Randomly generate a number between 0  & the number given
  //  this will be the index of our theme
    function GenerateRandomNumber(randNumRange){ return Math.floor(Math.random()*randNumRange); }


  //Collect all of the themes either:    [Dark] : True    or    [Light] : False
    function GetThemesByType(themeType){ 

      //Parse the Array containing all of the Themes & collect them accordingly
        for(i=0; i < allThemeNames.length; i++){

          //[Dark Theme Names]
            if(themeType && allThemeNames[i].includes("Dark")){ darkThemeNames.push(allThemeNames[i]); }

          //[Light Theme Names]
            else if(themeType && allThemeNames[i].includes("Light")){ lightThemeNames.push(allThemeNames[i]); }
        }
    }


  //Missing file warning function
    function MissingFileWarning(errorWarning){ vscode.window.showInformationMessage(errorWarning); console.log(errorWarning); }


//[TO DO!]
//
//  return FALSE   if the theme name selected matches the current theme applied (we will select a new random #)


  //Find the user's settings.json so we can write the new theme to the settings
    function ApplyNewTheme(newThemeName){

      //Find the user's  [settings.json]  and find a way to rewrite the  ["workbench.colorTheme"] to the new theme
        const settingsDir = path.join("C:", "Users", userName, "AppData", "Roaming", "Code", "User", "settings.json")


      //[DEBUG!!] Check if the path exists
        if(fs.existsSync(settingsDir)){

          //Collect the JSON file as a JSON
            const rawTxt = fs.readFileSync(settingsDir, "utf-8")
            const jsonData = JSON.parse(rawTxt);


          //Change the JSON theme and then save data to new variable
          //(we are going to rewrite the actual file with updated data)
            jsonData["workbench.colorTheme"] = newThemeName;


          //Rewrite the file with the updated json data
            fs.writeFileSync(settingsDir, JSON.stringify(jsonData, null, 4));
        }


      //Else, Theme Does not match to the current one, return true
        return true;
    }


//-----------------------------------------------------------------------------------------------------------------------------


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
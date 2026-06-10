/*
[Author]: John Bostater

[Creation Date]: 5/16/26


[Description]:
  Randomize the theme to the user's specifications.


[TO DO!!]

  -  Try and get the OS Type to differentiate between:   Windows & Mac OS

  -  If the user is using Windows OS & the settings.json cannot be found, create one?
        (do other checks to make sure the directory we want to create the new settings json into exists)


  -  Look for more themes! (only have access to the Default one right now)

  -  Optimize this script by only collecting all of this data to a json the first time this extension ever loads for quicker load times
      but also do a check to see if any new themes have been downloaded by the user! (then the code will run again as if it's the user's first time loading)

  -  Create a button that will order the theme names in the dropdown by alphabetical order
        (or do this be default??)

*/
 

//[Global]
//----------------------------------------

  //Reqs
    const vscode = require('vscode');
    const os = require('os');
    const path = require('path');
    const fs = require('fs');

  //Variables
    var revertTheme = "";
    var startingTheme = "";
    var settingsDir = "";
    var leadDir = "";
    var followDir = "";
    var completePath = "";
    var realLead = "";

  //Constants
    const userName = os.userInfo().username;
    const osType = os.type()

  //Arrays
    var allThemeNames = [];
    var darkThemeNames = [];
    var lightThemeNames = [];

//----------------------------------------


//[Allocations before Activation]
//-----------------------------------------------------------------------------------------------------------------------------


//[TO DO!!]
//  OS CHECK HERE!!

  //[Windows - File Path Allocations]
    if(osType == "Windows_NT"){

      //Find the user's  [settings.json]  and find a way to rewrite the  ["workbench.colorTheme"] to the new theme
        settingsDir = path.join("C:", "Users", userName, "AppData", "Roaming", "Code", "User", "settings.json")

      //See if the user's Directory leading up to mystery one exists
        leadDir = path.join("C:", "Users", userName, "AppData", "Local", "Programs", "Microsoft VS Code")

      //Reference to the directory containing the default themes json
        followDir = path.join("resources", "app", "extensions", "theme-defaults", "package.json");

    }

  //[Mac OS - File Path Allocations]
    else if(osType == "Darwin"){

      //Find the user's  [settings.json]  and find a way to rewrite the  ["workbench.colorTheme"] to the new theme
        settingsDir = path.join("C:", "Users", userName, "AppData", "Roaming", "Code", "User", "settings.json")

      //See if the user's Directory leading up to mystery one exists
        leadDir = path.join("C:", "Users", userName, "AppData", "Local", "Programs", "Microsoft VS Code")

      //Set the real lead
        realLead = leadDir;

      //Reference to the directory containing the default themes json
        followDir = path.join("resources", "app", "extensions", "theme-defaults", "package.json");

    }


  //Path exists, continue
    if(fs.existsSync(settingsDir) && osType == "Windows_NT" ){

      //Collect the JSON file as a JSON
        const rawTxt = fs.readFileSync(settingsDir, "utf-8")
        const jsonData = JSON.parse(rawTxt);

      //Collect the name of the current theme
        revertTheme = jsonData["workbench.colorTheme"];
        startingTheme = revertTheme;
    }
  
  //Else, do NOT let the proceed, we cannot change the theme if we cannot even find it first
    else{ console.log("CANNOT FIND the PATH TO the USER'S THEME"); return; }


  //[Lead directory DNE] activate flag
    if(!fs.existsSync(leadDir)){ MissingFileWarning("[ERROR]: VS Code Directory not found - {Change of Theme}"); return; }


  //Reference to the complete path of the directory
    if(osType == "Windows_NT"){ completePath = path.join(leadDir, followDir); }


  //Gather all of the directories past the lead (we will try a combo of paths until we come across the one we need)
    var searchDirectories = fs.readdirSync(leadDir, {withFileTypes: true} );


  //Parse every dir within the [searchDirectories]
  //  Try combinations until we find the path we need
    for(const parsedDir of searchDirectories){

      //Check if the complete path is found  & collect the real-lead path
        if(fs.existsSync(completePath) && parsedDir.isDirectory()){ console.log(`Path Found: ${completePath}`); break; }


      //Proceed to creating the file parsed is a folder
        else if(parsedDir.isDirectory()){ realLead = path.join(leadDir, parsedDir.name); completePath = path.join(leadDir, parsedDir.name, followDir); }

    }


  //Path still DNE, return
    if(!fs.existsSync(completePath)){ MissingFileWarning("[Error]: Default Theme DIR was never found - {Change of Theme}"); return;}


  //Load the .json data from the dump 
  //  maybe just gather the array of theme names directly from:   ["contributes"]["themes"][INDEX OF THEME]["label"]

  //Update the follow directory (search for other themes)
    followDir = path.join("resources", "app", "extensions");

  //Update the search directories to the other themes!
    searchDirectories = fs.readdirSync(path.join(realLead, followDir), {withFileTypes: true} );


  //Parse every dir within the [searchDirectories]
  //  Try combinations until we find the path we need
    for(const parsedDir of searchDirectories){

      //If the name of the parsed directory contains "theme" collect it!
        if(parsedDir.isDirectory() && parsedDir.name.includes("theme")){
         
          //Gather the JSON data
            const rawTxt = fs.readFileSync(path.join(realLead, followDir, parsedDir.name, "package.json"), "utf-8")
            const jsonData = JSON.parse(rawTxt);


          //[Default Theme Collection]
            if(parsedDir.name.includes("theme-default")){

              //For the length of the entire array, collect all names
                for(i=0; i < jsonData["contributes"]["themes"].length; i++){

                  //Gather the name of every theme and place it into our array
                    allThemeNames.push(jsonData["contributes"]["themes"][i]["id"]);

                }

            }
  
          //Else, [Regular Xollection]
            else{

              //Try and gather the names
                try{

                  //Gather the name of every theme and place it into our array
                    allThemeNames.push(jsonData["contributes"]["themes"][0]["id"]);

                }
              //Catch theme files with no length?
                catch{}
              
            }

        }

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


      //[Action Event Handling - All Items]
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
                vscode.window.showInformationMessage(`Random Theme Applied! [${newName}]`);

            }), 


          //[Revert Theme]
            vscode.commands.registerCommand("revertTheme", (item) => {

              //Revert the player's theme back
                ApplyNewTheme(revertTheme);

              //Inform the user of their choice
                vscode.window.showInformationMessage(`Reverting Theme back to: [${revertTheme}]`);

            }),

          //[First Theme]
            vscode.commands.registerCommand("startingTheme", (item) => {

              //Revert the player's theme back
                ApplyNewTheme(startingTheme);

              //Inform the user of their choice
                vscode.window.showInformationMessage(`Reverting back to Starting Theme: [${startingTheme}]`);

            }),


          //[Quick Select Theme]
            vscode.commands.registerCommand("dropDownThemeSelect", (item) => {

              //Apply the user's Quick Selection Choice
                ApplyNewTheme(item);

              //Inform the user of their choice
                vscode.window.showInformationMessage(`Switching to Theme: [${item}]`);
            })

        )
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

//[TO DO!!]
//  OS CHECK HERE!!
      //Find the user's  [settings.json]  and find a way to rewrite the  ["workbench.colorTheme"] to the new theme
        const settingsDir = path.join("C:", "Users", userName, "AppData", "Roaming", "Code", "User", "settings.json")

      //Path exists, continue
        if(fs.existsSync(settingsDir)){

          //Collect the JSON file as a JSON
            const rawTxt = fs.readFileSync(settingsDir, "utf-8")
            const jsonData = JSON.parse(rawTxt);

          //[Themes Match, return false]
            if(newThemeName == jsonData["workbench.colorTheme"]){ console.log("Names Match"); return false; }

          //[NEW!!]
          //Save the name of the last theme (if the user would like to revert it)
            revertTheme = jsonData["workbench.colorTheme"];

          //Change the JSON theme and then save data to new variable
          //(we are going to rewrite the actual file with updated data)
            jsonData["workbench.colorTheme"] = newThemeName;


          //Rewrite the file with the updated json data
            fs.writeFileSync(settingsDir, JSON.stringify(jsonData, null, 4));

          //Return true (file succesfully wrote to)
            return true;
        }


      //Else, Theme Does not match to the current one, return true
        return false;
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


          //Dropdown Items for the Quick Theme Select
            this.dropdowns = [{

              //[Quick Select Dropdown]
                label: "Quick Select Theme",
                children: allThemeNames
            }];

        }


      //[Displayed Objects/Classes]
        getChildren(element) {

          //Capture the [Buttons] && [DropDown]
            if(!element){

              //List of "Buttons" for the extension
                return [

                  //[Any Random Theme]
                    new Button("Any Random Theme", "Click to Run", "anyMode"),

                  //[Any Random Dark Theme]
                    new Button("Random Dark Theme", "Click to Run", "darkMode"),

                  //[Any Random Light Theme]
                    new Button("Random Light Theme", "Click to Run", "lightMode"),

                  //[Revert Theme]
                    new Button("Revert Theme", "Click to Run", "revertTheme"),

                  //[Default Theme]
                    new Button("Starting Theme", "Click to Run", "startingTheme"),
              
                  //[Quick Theme Select]
                    ...this.dropdowns.map( d => new DropdownItem(d.label, d.children) )
                ];
           
            }


          //Capture Expanded Element's Child items
            if(element.children) {

              //Return Leafs connected to [Theme Names] that we will be using
                return element.children.map( child => new ThemeName(child) );
            }

          //Else, return empty array
            return [];

        }


      //Refresh the tree items
        refresh(){ this._onDidChangeTreeData.fire(); }

      //Return the Leaf [i.e. Theme Names in Quick Select]
        getTreeItem(element){ return element; }

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

            //[Any Random Theme]
              else if(buttonName == "Revert Theme"){ this.iconPath = new vscode.ThemeIcon("arrow-left"); }

            //Save the first theme the user has applied (so they can revert back)
              else if(buttonName == "Starting Theme"){ this.iconPath = new vscode.ThemeIcon("sync"); }
              
          //===============================================================================================

        }
    }


  //[Dropdown Menu]
    class DropdownItem extends vscode.TreeItem {

      //Construct the UI Element
        constructor(label, children) {

          //Set Super to call constructor & set child Items
            super(label, vscode.TreeItemCollapsibleState.Collapsed);
            this.children = children;
        }
    }


  //[Leaf Item] for the Dropdown's {Theme Name(s)}
    class ThemeName extends vscode.TreeItem {

      //Construct the Leaf [Theme Names] UI Element
        constructor(label) {

          //Set Super to call constructor
            super(label,vscode.TreeItemCollapsibleState.None);


          //[Action-Event Call for the Leaf Item]
          //=============================================

            //Click action attached here
              this.command = {
                  command: "dropDownThemeSelect",
                  title: "Leaf clicked",
                  arguments: [label]
              };

          //=============================================

        }
    }

//--------------------------------------------------------------------------------------------


//[Export functions]
//------------------------------
  module.exports = { activate };
//------------------------------
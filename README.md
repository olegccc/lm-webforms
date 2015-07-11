# AngularJS web forms and dialogs with material design based on [Angular Material](https://material.angularjs.org)
  
If you don't want to worry about any HTML markup but want to edit your existing model then this framework is for you.
Just define your model - fields and their types, and get Angular.Material-powered dialogs and web forms ready to edit your models.

It is easy to notice that examples contain only bootstrap HTML markup like script and CSS references.

All code is written completely on TypeScript so you can use it in both JavaScript and TypeScript projects.
 
# Usage example

Suppose we have the following model:

```json
{
  "title": "New User",
  "fields": {
    "id": {
      "title": "id",
      "type": "number",
      "visible": false
    },
    "name": {
      "title": "Name",
      "type": "text",
      "required": true
    },
    "password": {
      "title": "Password",
      "type": "password",
      "repeat": true,
      "required": true
    },
    "email": {
      "title": "E-Mail",
      "type": "email",
      "required": true
    },
    "birthday": {
      "title": "Birth Date",
      "type": "date"
    },
    "description": {
      "title": "Description",
      "type": "rich_text"
    }
  }
}
```

Then we get the following dialog almost for free:

![Dialog screenshot](docs/screenshot-dialog.png)

# Supported data types

* Rich text - fully functional rich text editor based on CkEditor
* Code text - html/javascript/css/etc editor based on CodeMirror
* Select - combo box with predefined list (can be dynamic)
* Multi select - combo box with multiple selection from the list (can be dynamic)
* File - to upload a file
* File list - to upload a file list
* Password - to specify a password
* Number - to specify a numeric value
* Email - to specify e-mail address
* Image - to upload an image
* Date - to specify a date
* Text - simple text
* Boolean - to present checkbox
* Typeahed - simple text with automatic fill
* Multiline text - simple multiline text with automatic resizing
* Label - to show text information

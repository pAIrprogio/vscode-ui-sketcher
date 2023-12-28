import { TLUiOverrides, toolbarItem } from "@tldraw/tldraw";

export const myOverrides: TLUiOverrides = {
  actions(editor, actions) {
    // Create a new action or replace an existing one
    actions["my-new-action"] = {
      id: "my-new-action",
      label: "My new action",
      readonlyOk: true,
      kbd: "$u",
      onSelect(_source: any) {
        // Whatever you want to happen when the action is run
        window.alert("My new action just happened!");
      },
    };
    return actions;
  },
  tools(editor, tools) {
    // Create a tool item in the ui's context.
    tools.myNewTool = {
      id: "my-new-tool",
      icon: "triangle-down",
      label: "New Tool",
      kbd: "c",
      readonlyOk: false,
      onSelect: () => {
        // Wccchatever you want to happen when the tool is selected
        alert("Card tool selected!");
        editor.setCurrentTool("card");
      },
    };
    return tools;
  },
  toolbar(editor, toolbar, { tools }) {
    toolbar.splice(4, 0, toolbarItem(tools.myNewTool));
    return toolbar;
  },
};

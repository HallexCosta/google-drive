import AppController from "./src/appController.js";
import ConnectionManager from "./src/connectionManager.js";
import ViewManager from "./src/viewManager.js";
import DragAndDropManager from "./src/dragAndDropManager.js";

// const apiUrl = "https://localhost:3000";
const apiUrl = "https://gdrive-webapi-hallex.herokuapp.com";

const appController = new AppController({
  viewManager: new ViewManager(),
  dragAndDropManager: new DragAndDropManager(),
  connectionManager: new ConnectionManager({
    apiUrl,
  }),
});

try {
  await appController.initialize();
} catch (error) {
  console.error("error on initializing", error);
}

import { expect, describe, test, jest, beforeEach } from "@jest/globals";

import AppController from "../../public/src/appController.js";
import TestUtil from "../_util/TestUtil.js";

describe("#AppController", () => {
  describe("#updateCurrentFiles", () => {
    test("given all files from api and update the view", async () => {
      const filename = "profile.jpg";

      const mockFilesStatuses = TestUtil.mockFilesStatus([filename]);

      const mockConnectionManager = {
        currentFiles: jest.fn().mockResolvedValue(mockFilesStatuses),
      };
      const mockViewManager = {
        updateCurrentFiles: jest.fn(),
      };

      const mockDragAndDropManager = {};

      const appController = new AppController({
        connectionManager: mockConnectionManager,
        viewManager: mockViewManager,
        dragAndDropManager: mockDragAndDropManager,
      });

      await appController.updateCurrentFiles();

      expect(appController.viewManager.updateCurrentFiles).toHaveBeenCalledWith(
        mockFilesStatuses
      );
    });
  });

  describe("#onFileChange", () => {
    test.todo("should listen change on file");
  });

  describe("#updateProgress", () => {
    test.todo("");
  });

  describe("#onProgress", () => {
    test.todo("");
  });

  describe("#onDropHandler", () => {
    test.todo("");
  });

  describe("#initialize", () => {
    test.todo("");
  });
});

import { expect, describe, test, jest, beforeEach } from "@jest/globals";

import ConnectionManager from "../../public/src/connectionManager.js";
import TestUtil from "../_util/TestUtil.js";

describe("#ConnectionManager", () => {
  const apiUrl = "https://localhost:3000";

  const ioClient = {
    id: "some_socketId",
    on: jest.fn(),
  };

  const socket = {
    connect: jest.fn().mockReturnValue(ioClient),
    on: jest.fn(),
  };

  beforeEach(() => {
    window.io = socket;

    jest
      .spyOn(window.console, window.console.log.name)
      .mockImplementation(() => {});
  });

  describe("#currentFiles", () => {
    test("given current files from api url", async () => {
      const filename = "profile.jpg";

      const mockFilesStatuses = TestUtil.mockFilesStatus([filename]);

      const fetchResponse = {
        json: async () => mockFilesStatuses,
      };

      global.fetch = jest.fn().mockResolvedValue(fetchResponse);

      const connectionManager = new ConnectionManager({ apiUrl });

      const expectedResult = await connectionManager.currentFiles();
      const ioConnectParams = {
        apiUrl,
        options: {
          withCredentials: false,
        },
        values: () => Object.values(ioConnectParams),
      };

      expect(global.fetch).toHaveBeenCalledWith(apiUrl);
      expect(expectedResult).toBe(mockFilesStatuses);
    });
  });

  describe("#uploadFile", () => {
    test("should upload an file to api", async () => {
      const connectionManager = new ConnectionManager({ apiUrl });

      const day = "2002-07-16 00:00:00";
      const lastModifiedMedia = TestUtil.getTimeFromDate(day);

      TestUtil.mockDateNow([lastModifiedMedia]);

      const filenameMedia = "Anime.mp4";

      const fileMedia = new File([], filenameMedia, {
        type: "video/mp4",
        lastModified: lastModifiedMedia,
      });

      global.fetch = jest.fn().mockResolvedValue({
        json: async () => [filenameMedia],
      });

      // sorry, I couldn't mock the onConnect method
      const socketId = "some_socketId";
      connectionManager.socketId = socketId;

      const formData = new FormData();
      formData.append("files", fileMedia);

      const mockFetchOptions = {
        body: formData,
        method: "POST",
      };

      const expectedResult = await connectionManager.uploadFile(fileMedia);

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}?socketId=${socketId}`,
        mockFetchOptions
      );

      expect(expectedResult).toStrictEqual([filenameMedia]);
    });
  });

  describe("#ioConnect", () => {
    test("should connect to socket io", () => {
      const connectionManager = new ConnectionManager({ apiUrl });

      const ioConnectParams = {
        apiUrl,
        options: {
          withCredentials: false,
        },
        values: () => Object.values(ioConnectParams),
      };

      expect(window.io.connect).toHaveBeenCalledWith(apiUrl, {
        withCredentials: false,
      });
      expect(connectionManager.ioClient).toStrictEqual(ioClient);
    });
  });

  describe("#onConnect", () => {
    test("should save socketId from user connected", () => {
      const connectionManager = new ConnectionManager({});

      connectionManager.onConnect();

      expect(connectionManager.socketId).toBe("some_socketId");
    });
  });

  describe("#configureEvents", () => {
    test('should subscribe "file-upload" and "connect" event to socket', () => {
      const connectionManager = new ConnectionManager({});

      const mockOnConnect = jest.fn();

      const mockOnProgress = jest.fn();

      const mockOnConnectBound = mockOnConnect.bind(connectionManager);

      // jest
      //   .spyOn(connectionManager, connectionManager.onConnect.name)
      //   .mockImplementation(mockOnConnect);

      // forçando a substituição do onConnect para usar o mock
      connectionManager.onConnect = mockOnConnect;

      jest
        .spyOn(
          connectionManager.onConnect,
          connectionManager.onConnect.bind.name
        )
        .mockImplementation(mockOnConnectBound);

      connectionManager.configureEvents({
        onProgress: mockOnProgress,
      });

      // console.log(connectionManager.ioClient.on.mock.calls);
      expect(connectionManager.ioClient.on).toHaveBeenNthCalledWith(
        1,
        "connect",
        mockOnConnect.bind(connectionManager)
      );
      expect(connectionManager.ioClient.on).toHaveBeenNthCalledWith(
        2,
        "file-upload",
        mockOnProgress
      );
    });
  });
});

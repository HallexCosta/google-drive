import {
  jest,
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
} from "@jest/globals";
import fs from "fs";
import FormData from "form-data";

import TestUtil from "../_util/testUtil.js";

import Routes from "../../src/routes.js";
import { logger } from "../../src/logger.js";
import { tmpdir } from "os";
import { join } from "path";

describe("#Routes Integration Test", () => {
  let defaultDownloadsFolder = "";
  beforeAll(async () => {
    defaultDownloadsFolder = await fs.promises.mkdtemp(
      join(tmpdir(), "downloads-")
    );
  });

  afterAll(async () => {
    await fs.promises.rm(defaultDownloadsFolder, {
      recursive: true,
    });
  });

  beforeEach(() => {
    jest.spyOn(logger, "info").mockImplementation();
  });

  describe("#getFileStatus", () => {
    const ioObj = {
      to: (id) => ioObj,
      emit: (event, message) => {},
    };

    test("should upload file to the folder", async () => {
      const filename = "profile.jpg";
      const fileStream = fs.createReadStream(
        `./test/integration/mocks/${filename}`
      );
      const request = TestUtil.generateReadableStream(() => {});
      const response = TestUtil.generateWritableStream(() => {});

      const form = new FormData();
      form.append("photo", fileStream);

      const defaultParams = {
        request: Object.assign(form, {
          headers: form.getHeaders(),
          method: "POST",
          url: "?socketId=10",
        }),
        response: Object.assign(response, {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn(),
        }),
        values: () => Object.values(defaultParams),
      };

      const routes = new Routes(defaultDownloadsFolder);
      routes.setSocketInstance(ioObj);

      const dirBeforeRan = await fs.promises.readdir(defaultDownloadsFolder);
      expect(dirBeforeRan).toEqual([]);

      await routes.handler(...defaultParams.values());

      const dirAfterRan = await fs.promises.readdir(defaultDownloadsFolder);
      expect(dirAfterRan).toEqual([filename]);

      expect(defaultParams.response.writeHead).toHaveBeenCalledWith(200);

      const expectedResult = JSON.stringify({
        result: "Files uploaded with success!",
      });

      expect(defaultParams.response.end).toHaveBeenCalledWith(expectedResult);
    });

    test("should list files to the folder", async () => {
      const filename = "profile.jpg";

      const request = TestUtil.generateReadableStream(() => {});
      const response = TestUtil.generateWritableStream(() => {});

      const defaultParams = {
        request: Object.assign(request, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          method: "GET",
          url: "/",
        }),
        response: Object.assign(response, {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn(),
        }),
        values: () => Object.values(defaultParams),
      };

      const routes = new Routes(defaultDownloadsFolder);
      routes.setSocketInstance(ioObj);

      await routes.handler(...defaultParams.values());

      const allFilesFromDefaultsDownloadsFolder = await fs.promises.readdir(
        defaultDownloadsFolder
      );

      expect(allFilesFromDefaultsDownloadsFolder).toEqual([filename]);

      expect(defaultParams.response.writeHead).toHaveBeenCalledWith(200);

      const fileStat = await fs.promises.stat(
        `${defaultDownloadsFolder}/${filename}`
      );

      const expectedResult = JSON.stringify([
        {
          size: "292 kB",
          file: filename,
          lastModified: fileStat.birthtime,
          owner: "hallexcosta",
        },
      ]);

      expect(defaultParams.response.end).toHaveBeenCalledWith(expectedResult);
    });
  });
});

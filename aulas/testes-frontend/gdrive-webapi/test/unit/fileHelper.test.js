import { jest, describe, test, expect } from "@jest/globals";
import fs from "fs";

import FileHelper from "../../src/fileHelper.js";

describe("#FileHelper test suite", () => {
  describe("#getFileStatus", () => {
    test("it should return files statuses in correct format", async () => {
      const statMock = {
        dev: 2064,
        mode: 33252,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 450346,
        size: 291635,
        blocks: 576,
        atimeMs: 1630984804190.2856,
        mtimeMs: 1630984804210.2856,
        ctimeMs: 1630984804210.2856,
        birthtimeMs: 1630984804190.2856,
        atime: "2021-09-07T03:20:04.190Z",
        mtime: "2021-09-07T03:20:04.210Z",
        ctime: "2021-09-07T03:20:04.210Z",
        birthtime: "2021-09-07T03:20:04.190Z",
      };

      const mockUser = "hallexcosta";
      process.env.USER = mockUser;
      const filename = "profile.png";

      jest
        .spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename]);

      jest
        .spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock);

      const result = await FileHelper.getFilesStatus("/tmp");

      const expectedResult = [
        {
          size: "292 kB",
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename,
        },
      ];

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);
      expect(result).toMatchObject(expectedResult);
    });
  });
});

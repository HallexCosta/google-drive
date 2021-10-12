import { jest } from "@jest/globals";
import fs from "fs";

export default class TestUtil {
  static mockDateNow(mockImplementationPeriods) {
    const now = jest.spyOn(global.Date, global.Date.now.name);

    mockImplementationPeriods.forEach((time) => {
      now.mockReturnValueOnce(time);
    });
  }

  static getTimeFromDate(dateString) {
    return new Date(dateString).getTime();
  }

  static mockFilesStatus(files = []) {
    return files.map((file) => ({
      size: `${Math.ceil(Math.random() * 2)} kB`,
      file,
      lastModified: Date.now(),
      owner: process.env.USER,
    }));
  }
}

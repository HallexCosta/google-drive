export default class AppController {
  constructor({ connectionManager, viewManager, dragAndDropManager }) {
    this.connectionManager = connectionManager;
    this.viewManager = viewManager;
    this.dragAndDropManager = dragAndDropManager;

    this.uploadingFiles = new Map();
    this.amountUploadFiles = 0;
  }

  async initialize() {
    this.viewManager.configureFileBtnClick();
    this.viewManager.configureModal();
    this.viewManager.configureOnFileChange(this.onFileChange.bind(this));
    this.dragAndDropManager.initialize({
      onDropHandler: this.onDropHandler.bind(this),
    });

    this.connectionManager.configureEvents({
      onProgress: this.onProgress.bind(this),
    });

    this.viewManager.updateStatus(0);

    await this.updateCurrentFiles();
  }

  async onDropHandler(files) {
    this.onFileChange(files);
  }

  async onProgress({ processedAlready, filename }) {
    console.debug({ processedAlready, filename });
    const file = this.uploadingFiles.get(filename);

    const chunkBytes = (processedAlready / file.size) * 100;
    const alreadyProccess = Math.ceil(chunkBytes);

    this.updateProgress(file, alreadyProccess);

    if (alreadyProccess < 98) return;

    return this.updateCurrentFiles();
  }

  updateProgress(file, percent) {
    const uploadingFiles = this.uploadingFiles;
    file.percent = percent;

    const total = [...uploadingFiles.values()]
      .map(({ percent }) => percent ?? 0)
      .reduce((total, current) => total + current, 0);

    this.viewManager.updateStatus(Math.round(total / uploadingFiles.size));
  }

  async onFileChange(files) {
    // aqui tem um bug conhecido, se no meio do upload
    // voce fazer outro upload, ele vai fechar o modal
    // e iniciar do zero
    this.viewManager.openModal();
    this.viewManager.updateStatus(0);

    const request = [];

    for (const file of files) {
      this.uploadingFiles.set(file.name, file);
      const fileJSON = this.connectionManager.uploadFile(file);
      request.push(fileJSON);
    }

    await Promise.all(request);

    this.viewManager.updateStatus(100);

    setTimeout(() => this.viewManager.closeModal(), 1500);

    await this.updateCurrentFiles();
  }

  async updateCurrentFiles() {
    const files = await this.connectionManager.currentFiles();
    this.viewManager.updateCurrentFiles(files);
  }
}

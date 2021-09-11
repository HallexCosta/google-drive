export default class AppController {
  constructor({ connectionManager, viewManager, dragAndDropManager }) {
    this.connectionManager = connectionManager;
    this.viewManager = viewManager;
    this.dragAndDropManager = dragAndDropManager;

    this.uploadingFiles = new Map();
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
    const alreadyProccess = Math.ceil((processedAlready / file.size) * 100);

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

    this.viewManager.updateStatus(total);
  }

  async onFileChange(files) {
    // aqui tem um bug conhecido, se no meio do upload
    // voce fazer outro upload, ele vai fechar o modal
    // e iniciar do zero
    this.uploadingFiles.clear();
    this.viewManager.openModal();
    this.viewManager.updateStatus(0);

    const request = [];

    for (const file of files) {
      this.uploadingFiles.set(file.name, file);
      request.push(this.connectionManager.uploadFile(file));
    }

    await Promise.all(request);
    this.viewManager.updateStatus(100);

    setTimeout(() => this.viewManager.closeModal(), 1000);

    await this.updateCurrentFiles();
  }

  async updateCurrentFiles() {
    const files = await this.connectionManager.currentFiles();
    this.viewManager.updateCurrentFiles(files);
  }
}

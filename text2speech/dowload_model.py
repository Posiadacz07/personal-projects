from huggingface_hub import snapshot_download

snapshot_download(repo_id="facebook/mms-tts-pol", local_dir="model")

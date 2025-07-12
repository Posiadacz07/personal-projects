# Usage: python text2speech --model MODEL_PATH --output OUTPUT_FILE --text TEXT_TO_BE_CONVERTED_TO_SPEECH

import argparse

from transformers import VitsModel, AutoTokenizer
import torch

import scipy


# Parse arguments
# Application will run without any arguments provided based on defaults values
#
# Model will be automatically downloaded form HuggingFace endpoint
# File will be saved as "output.wav" in current directory
# Generated speech will be for the following text: "To jest domyślny tekst"
parser = argparse.ArgumentParser()
parser.add_argument(
    "--model",
    type=str,
    default="facebook/mms-tts-pol",
    help="Text2speech model location.",
)
parser.add_argument(
    "--output",
    type=str,
    default="output.wav",
    help="Path to the output file.",
)
parser.add_argument(
    "--text",
    type=str,
    default="To jest domyślny tekst",
    help="Text to be transofrmed into a speech"
)

args = parser.parse_args()

model_path = args.model
output_path = args.output
text = args.text

print(">>>> Loading model <<<<")
model = VitsModel.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)
print(">>>> Model loaded <<<<")

inputs = tokenizer(text, return_tensors="pt")

print(">>>> Generating speech for provided text <<<<")
with torch.no_grad():
    output = model(**inputs).waveform
print(">>>> Output generated <<<<")

print(f">>>> Save output to the file {output_path} <<<<")
scipy.io.wavfile.write(output_path, rate=model.config.sampling_rate, data=output.float().numpy().T)
print(">>>> File saved <<<<")

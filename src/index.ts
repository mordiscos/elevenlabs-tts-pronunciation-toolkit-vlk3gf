import { ElevenLabsClient } from "elevenlabs";
import * as fs from "fs";

// Initialize ElevenLabs client with your API key
const elevenlabs = new ElevenLabsClient({
  apiKey: "YOUR_API_KEY"
});

async function stream(audioStream: NodeJS.ReadableStream) {
  // Example function to handle audio streaming
  // In a real scenario, you would handle the audio data appropriately (e.g., play it or save to a file)
  audioStream.pipe(process.stdout); // This will output the audio stream to the console
}

async function main() {
  try {
    // Step 1: Create a pronunciation dictionary from a file
    const pronunciationFile = fs.createReadStream("/path/to/your/pronunciation_file.pls");
    const pronunciationDictionaryCreation = await elevenlabs.pronunciationDictionary.createFromFile(pronunciationFile, {
      name: "CustomPronunciation"
    });

    console.log("Pronunciation Dictionary Created:", pronunciationDictionaryCreation);

    // Play the sound with the pronunciation dictionary
    const audioStream = await elevenlabs.textToSpeech.convert("Rachel", {
      text: "Tomato",
      pronunciation_dictionary_locators: [{ id: pronunciationDictionaryCreation.id, version_id: pronunciationDictionaryCreation.latest_version_id }],
      model_id: "eleven_multilingual_v2"
    });

    await stream(audioStream);

    // Step 2: Remove the rule from the pronunciation dictionary
    const removeResponse = await elevenlabs.pronunciationDictionary.removeRulesFromThePronunciationDictionary(pronunciationDictionaryCreation.id, {
      rule_strings: ["rule_string_to_remove"]
    });

    console.log("Rule Removed:", removeResponse);

    // Play the sound "Tomato" after removing the rule
    const audioStreamAfterRemoval = await elevenlabs.textToSpeech.convert("Rachel", {
      text: "Tomato",
      model_id: "eleven_multilingual_v2"
    });

    await stream(audioStreamAfterRemoval);

    // Step 3: Add rules to the pronunciation dictionary and play the sound
    const addRulesResponse = await elevenlabs.pronunciationDictionary.addRulesToThePronunciationDictionary(pronunciationDictionaryCreation.id, {
      rules: [
        {
          type: "alias",
          string_to_replace: "tomato",
          alias: "Toh-mah-toh"
        }
      ]
    });

    console.log("Rules Added:", addRulesResponse);

    // Play "Tomato" using the updated pronunciation dictionary
    const audioStreamWithNewRules = await elevenlabs.textToSpeech.convert("Rachel", {
      text: "Tomato",
      pronunciation_dictionary_locators: [{ id: pronunciationDictionaryCreation.id, version_id: addRulesResponse.version_id }],
      model_id: "eleven_multilingual_v2"
    });

    await stream(audioStreamWithNewRules);

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();

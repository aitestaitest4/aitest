curl -s -H "Content-Type: application/json" \
-H "X-Goog-User-Project: $(gcloud config list --format="value(core.project)")" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
https://speech.googleapis.com/v1p1beta1/speech:longrunningrecognize \
--data '{
  "config": {
    "languageCode": "mr-IN",
    "enableWordTimeOffsets": true,
    "enableWordConfidence": true,
    "model": "default",
    "encoding": "LINEAR16",
    "sampleRateHertz": 24000,
    "audioChannelCount": 1
  },
  "audio": {
    "content": "avcjjkdsahf"  }
}' > long_running_recognize_response.txt
# sleep 10s to wait for processing.
sleep 10

# extract operation number.
operation_number=`grep -Eo '[0-9]+' long_running_recognize_response.txt`

while true; do
  # If the operation has not completed, you can poll the endpoint by repeatedly making the GET request until the 'done' property of the response is true.
  op=`curl -s -H "Content-Type: application/json" \
  -H "X-Goog-User-Project: $(gcloud config list --format="value(core.project)")" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://speech.googleapis.com/v1/operations/$operation_number"`

  # write the response into 'output.txt' file.
  echo "${op}" >> output.txt
  val=$(echo "${op}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('done', False))")

  if [[ "${val}" == "True" ]]; then
    break
  fi
  sleep 5
done
i need this api as well 
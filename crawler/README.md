# Twitter crawler 사용설명서

## 크롤링
 1. 트위터 검색 search.twitter.com 에서 since와 until 범위 조건으로 트위터 검색합니다. 이때 너무 범위를 크게 하지 마십시오. 10일 정도가 적당합니다.
 2. 더 이상 트윗이 나오지 않을 때까지 PgDn키를 누르고 있습니다. 키보드에 동전 같은 거 끼워두시고 다른 컴퓨터에서 용무 보시면 됩니다.(검색 API는 외부로 노출되지 않아 이런 편법을 씁니다)
 3. 트윗이 더 나오지 않는 것을 확인하신 후, Ctrl+S 를 눌러 웹 페이지 전체를 저장합니다.

## 트윗 추출
 4. 위에서 추출한 html파일(같이 생성되는 폴더는 필요없으니 지웁니다)을 아래 명령으로 실행합니다.
 5. node parseraw.js ./raw_data/beginagain/2014-08-13-2014-08-19.html > beginagain-0813-0819.json
 6. 위 명령은 크롤된 html파일에서 유효한 정보를 추출하여 json파일로 만듭니다.
 
## 트윗 병합
 7. 4-6단계에서 만들어진 json 파일들을 병합합니다.
 8. node mergejson.js beginagain-*.json > merged-beginagain-0813-1013.json
 9. 주의! 여러 json 파일을 한 번에 지정해야 정상적으로 병합합니다.
 
## 병합된 트윗 포매팅
 10. 7-9단계에서 만든 JSON파일은 사람이 읽기 힘든 포맷으로 출력됩니다. 일단 이것 그대로 mongoDB에 적재한 후 분석을 하겠지만 일단 당장 데이터 자체를 리뷰할 수 있게 포매팅법을 알려드립니다.
 11. python3 json_prettify.py merged-beginagain-0813-1013.json > prettify-beginagain-0813-1013.json
 
python2를 사용하면 한글이 깨지는 등의 부작용이 발생할 수 있습니다.

생성된 JSON파일은 시간 순서로 정렬되지 않았습니다. 따라서 데이터 분석을 위해서는 mongoDB에 위 데이터를 적재하고 후처리 몇 가지를 해야 합니다. 이 단계부터는 분석할 목적에 맞춰서 보고서 생성 알고리즘을 작성해야 합니다.


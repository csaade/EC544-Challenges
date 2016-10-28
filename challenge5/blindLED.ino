//PRODUCT_ID(1783)
//PRODUCT_VERSION(14)

int led = D7;

void setup() {

  pinMode(led, OUTPUT);

}

void loop() {

  digitalWrite(led, HIGH);
  delay(1000);
  digitalWrite(led, LOW);
  delay(1000);

}

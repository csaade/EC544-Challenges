M = csvread('output.csv',1,0);

model = ClassificationKNN.fit(M(:,1:4),M(:,5))

location_label = predict(model, M(120,1:4))
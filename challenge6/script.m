%% MATLAB script acts as a TCP client
% Reads value into a string sent by node.js (which is an array of RSS values)
% call eval() on that string to convert it to an array
% call predict() with this value
% return this value through TCP socket so it can be read by node.js


%% CODE

M = csvread('output.csv',1,0);
model = ClassificationKNN.fit(M(:,1:4),M(:,5));
%location_label = predict(model, M(120,1:4));



% Note: we constantly read data from connection
while 1
    obj = tcpip('localhost',8080, 'InputBufferSize',8000,'NetworkRole','Client');

    % opening tcp connection
    fopen(obj)
    pause(2)
    
    % reading data
    while(obj.BytesAvailable)
      data=fscanf(obj)
    end
    % parsing data
    curr_state = eval(data);
    
    % getting prediction
    location_label = predict(model, curr_state);
    % sending prediction to server
    fwrite(obj, num2str(location_label))
    fclose(obj)
    
end
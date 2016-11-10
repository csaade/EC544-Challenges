%% MATLAB script acts as a TCP client
% Reads value into a string sent by node.js (which is an array of RSS values)
% call eval() on that string to convert it to an array
% call predict() with this value
% return this value through TCP socket so it can be read by node.js


%% CODE

obj = tcpip('localhost',8080, 'InputBufferSize',8000,'NetworkRole','Client');

% Note: we constantly read data from connection
while 1
    
    % opening tcp connection
    fopen(obj)
    pause(2)
    
    % reading data
    while(obj.BytesAvailable)
      data=fscanf(obj) 
    end
    fwrite(obj, 'successfully received data')
    fclose(obj)
    
end
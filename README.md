# test-splunk-apps

cd $APP_FOLDER

# install grunt
sudo npm install -g grunt

# install dependencies
npm install

# build
grunt

# install 
splunk install app xxx.spl

# Start with the AWS Lambda Node.js base image
FROM public.ecr.aws/lambda/nodejs:16

# Install system dependencies required by LibreOffice
RUN yum -y install tar gzip

# Install missing dependencies for LibreOffice
RUN yum -y install libXinerama mesa-libGLU

# Install LibreOffice
RUN curl -Ls "https://mirror1.cs-georgetown.net/tdf/libreoffice/stable/24.2.1/rpm/x86_64/LibreOffice_24.2.1_Linux_x86-64_rpm.tar.gz" | tar -xz \
    && yum localinstall -y LibreOffice_24.2.1.2_Linux_x86-64_rpm/RPMS/*.rpm

# Copy your function code and package.json into the image
COPY . ${LAMBDA_TASK_ROOT}

# Install NPM dependencies
RUN npm install

# Set the CMD to your handler
CMD ["index.handler"]

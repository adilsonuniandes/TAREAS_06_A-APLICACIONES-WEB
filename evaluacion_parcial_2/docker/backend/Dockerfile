FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /app
COPY . .
RUN dotnet restore
RUN dotnet build
EXPOSE 8080
CMD ["dotnet", "run", "--urls=http://0.0.0.0:8080"]

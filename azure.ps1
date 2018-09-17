# Create the resource group
az group create --name badgesRG --location "East US"

# Create the COSMOS Db Account
az cosmosdb create --name badgesDB --resource-group badgesRG --kind MongoDB

# Get the DB key
az cosmosdb list-keys --name badgesDB --resource-group badgesRG

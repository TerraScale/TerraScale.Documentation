---
title: Pricing
description: Pricing information for TerraScale products and services.
---

## Database Operations
We want to be really transparent about datbase operations, for us it is more expansive to write than read
because the way we architected our database engine.
But for the sake of making it simpler in the pricing plan and metrics for the end user we united all database operations
together and we also didnt want to create a made up unit like Cosmos DB did, we are open to feedback before we do the 
first stable version of TerraScale to change this.

### Global Replication
So how many database operations really takes to have our main feature which is replicating and having the same data
on multiple regions?

For this example let's use some made up numbers multiple of 10 so you can easily adapt the calculations for your use case

Let's say that we have a database replicating to 10 regions when you write (create/update) any document you can 
consider that you are writing to all of them, so it is going to cost 10 database operations.

But if you are reading an document it will cost only one operation because you are reading only from the closest region.

#### What about querying?

Well querying is a more difficult to calculate before doing the operation than all the other operations.

Depending on the query that you are doing it is going to cost different amount of datbase operations.

Again to simplify the pricing for you the end user we will only charge a datbase operation for the returned documents
(this can be changed before stable release)
So for example you are querying using regex we cannnot use our index to execute the query so we are basically doing a
for each document we evaluate the regex to see if the document qualifies for the query then we return; this also
means that this query is going to take longer to execute, the higher the document count on your datbase the longer it
is going to take to execute queries like regex and operators that do not use our index.

TODO: are we going to charge for scanned documents or just the result?


If you use queries that can leverage our indexing engine for example equals, less than, greater than the query is going
to be really fast independent of the amount of documents you have on your database.

Some optimizations that you can do with hand written queries let's say for example
```json
{
    "_id": {
        "$ne" : null
    }
}
```
Instead write like this:
```json
{
{
    "_id": {
        "$gt" : 1
    }
}
}
```

Why? because null is not a simple check, we need to iterate/scan all documents and run an `if` to check if the value 
is considered null or not, if instead you use greater than we can use our index to evaluate the query.

OBS: That is why we limit the query to a max of 100 items and we highly recommend using our pagination feature.

## Storage
### Why is storage priced the way it is?

We store on each region 2 copies of your database for higly availability, so when we are updating the datbase version
we rollout one node by one and we wait for that node to be healthy and available before moving on with the rest of the nodes

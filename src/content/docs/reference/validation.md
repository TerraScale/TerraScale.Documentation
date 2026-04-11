---
title: Validation
description: Information about TerraScale's data replication strategies.
---

# Validation

Short explication we will not validate any kind of schema or anything else.

# Why?

We think that the validation step is better at your backend or full stack application instead of the database
the datbase should just be a way to save data and query data and nothing else.

And most of the time the backend or the code that saves to the database already validates the data, why should we 
validate it again at the database layer?

Again i believe that the database should be simple and just store the data that you need and make it easier for you
to query that data, u think that migrations,orm,schema and etc just creates overhead and make the DX horrible.
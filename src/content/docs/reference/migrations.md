---
title: Migrations
description: Information about TerraScale's data replication strategies.
---

# Migrations

Short explication we will not have a SQL like migration system or maybe we will not have it all.

# How to handle migration?

We can add a feature that you can write a javascript script that has some conditions and create the new fields or delete
old fields.

Or the recommended way is when you access the data that has an old schema/structure you update it and save it.

We might make this process easier in the future like having a javascript middleware, whenever you run an specific
operation we can run the javascript and manipulate the data. *THIS IS NOT A FEATURE* but could be if enough people request it.


# Why?

I think that writing migration using code is better than having something like EntityFramework that "magically" creeates
migration script for you that can fail and you have to battle with it to make it work or the common case of deleting
the migration history table and running everything again.
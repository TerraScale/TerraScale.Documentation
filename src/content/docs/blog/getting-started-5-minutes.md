---
title: From Zero to Database in 5 Minutes
date: 2024-04-02
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - tutorial
  - getting-started
excerpt: I timed myself. From opening the browser to running my first query took 4 minutes and 37 seconds. Here's exactly what I did.
---

I timed myself this morning. From opening my browser to running my first query against TerraScale took 4 minutes and 37 seconds. Here's the exact steps, nothing skipped.

## Minute 0-1: Sign Up

Headed to [dashboard.terrascale.io](https://dashboard.terrascale.io) and clicked "Get Started." Entered my email, created a password, verified my email (the link arrived in about 10 seconds).

Pro tip: if you're impatient like me, use Google sign-in. Saves about 30 seconds.

## Minute 1-2: Create a Database

After signing in, there's a big "Create Database" button. Hard to miss.

I called mine `blog-demo` and picked `us-east-1` as the region. The database was ready in about 8 seconds - I actually refreshed the page thinking something was stuck, but nope, it was just that fast.

## Minute 2-3: Generate an API Key

Clicked on "API Keys" in the sidebar, then "Create API Key." Named it "local-dev" and gave it full database access.

**Important:** The key only shows once. I copied it to my `.env` file immediately. If you forget, you'll need to create a new one.

## Minute 3-4: Install the SDK and Write Code

Opened my terminal and ran:

```bash
dotnet add package TerraScale.Client
```

Then wrote the simplest possible test:

```csharp
using TerraScale;

var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY"),
    DatabaseId = "blog-demo"
});

// Write something
await client.PutItemAsync("user#123", "profile", new Dictionary<string, object>
{
    ["name"] = "Mario",
    ["email"] = "mariogk@terrascale.tech"
});

// Read it back
var result = await client.GetItemAsync("user#123", "profile");
Console.WriteLine(result.Value.GetAttribute<string>("name")); // Mario
```

## Minute 4-5: Run It

```bash
dotnet run
```

Output: `Mario`

That's it. No connection strings to configure, no ports to remember, no local database to spin up. Just an API key and a database ID.

## What Just Happened?

Under the hood, a lot happened:

1. My request hit TerraScale's edge network
2. Got routed to the us-east-1 region where my database lives
3. The item got written to multiple availability zones for durability
4. The response came back in about 12ms (I checked)

But I didn't have to think about any of that. I just wrote code.

## What's Next?

If you want to go deeper, here's what I'd suggest:

1. **Try the Query Explorer** in the dashboard - you can run queries without writing code
2. **Set up the Repository pattern** for typed entities - way cleaner than raw dictionaries
3. **Add a second region** and watch your data replicate automatically

The [Getting Started guide](/guides/getting-started/) goes into more detail on each of these. But honestly, just start building something. You'll figure it out as you go.

The best part? That database I created is on the free tier. I'm not paying anything until I exceed 100MB of storage or 10,000 requests per month. For a side project or prototype, that's plenty.

Happy building!

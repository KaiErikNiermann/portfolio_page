---
title: A minimal modern deep learning cloud setup
description: During my machine learning course I realized how critical it can be to have a stable performant machine learning setup from the get-go, so this is just an overview of how my workflow was in the end.
published: '2024-03-20'
tags:
  - ml
  - GCP
  - deep-learning
---

# Overview

This is a setup guide aimed at people new to GCP and a general cloud workflow with GPUs.

### Table of contents

---

# GCP VM setup 
## login and basics
For this we are going to use GCP compute engine VMs specifically with GPUs, starting off [here](https://cloud.google.com/products/compute?hl=en) and activate the compute engine API. 

> You might have to input your payment information but you will most likely get around 300$ in credits which equates to roughly 300 hours of VM usage, so assuming this is your first time using GCP you shouldn't be too worried. 

Once you set up everything you should be greeted with a screen similar to this. 

<figure style="display: flex; align-items: center; flex-direction: column;">
  <img src="https://i.imgur.com/6gF0oKh.png" alt="screen" style="width: 100%;">
</figure>

It's a bit overwhelming but the two most important things for now are **CREATE INSTANCE** and the *External IP* ( which you use to connect to the VM ). 

## quota check

Before we the instance - since we want to use GPUs - we have to check if our GPU quota (number of GPUs allowed) is >0, since for some reason an issue is that the default is sometimes 0. To check this 
1. Click on the search bar above **CREATE INSTANCE** 
2. Look for `All quotas`
3. In the field `Enter property name or value` look for `Name:GPUs (all regions)`
4. Click the little checkbox next to the name 
5. Click `EDIT QUOTAS` (top right of the screen)
6. Type 1 (if you want multiple GPUs then type more)
7. Hit `SUBMIT REQUEST`

Visually this looks something like this 

<figure style="display: flex; align-items: center; flex-direction: column;">
  <img src="https://i.imgur.com/a1lixKV.png" alt="screen" style="width: 100%;">
</figure>

## creating an instance 

Click **CREATE INSTANCE** 

### Machine configuration

1. For **Name** type whatever you want (I usually just leave the default)
2. For **Region** I'd recommend one of the US ones since they tend to have the most availability for GPUs
3. For **Zone** it doesn't matter too much (you can leave the default)
4. For **Machine family** select **GPUs**
5. For **GPU type** select **NVIDIA T4** (this is the cheapest option)
6. For **Number of GPUs** select **1** (you can select more if you want but this is the cheapest option)
7. For **Machine type** you can either select a preset or customize it, I'd recommend at least 4 cores and 15GB of RAM

### Boot disk

1. Click **CHANGE**
2. For **Operating system** select **Deep Learning on Linux**
3. For **Version** select the latest one with CUDA
4. For **Size (GB)** I'd recommend at least 100GB

### Identity and API access

1. For **Service account** select **Compute Engine default service account**
2. For **Access scopes** select **Allow full access to all Cloud APIs**

### Firewall

1. Check **Allow HTTP traffic**
2. Check **Allow HTTPS traffic**

Then click **CREATE**

## connecting to your VM

Once your VM is created you can connect to it by clicking the **SSH** button next to the VM name. This will open a new window with a terminal connected to your VM.

Alternatively you can use the `gcloud` CLI to connect to your VM. First install the CLI by following the instructions [here](https://cloud.google.com/sdk/docs/install). Then run the following command:

```bash
gcloud compute ssh --zone "YOUR_ZONE" "YOUR_VM_NAME" --project "YOUR_PROJECT_ID"
```

## setting up VSCode remote

If you want to use VSCode to connect to your VM you can use the Remote - SSH extension. First install the extension by clicking [here](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh). Then follow these steps:

1. Press `Ctrl+Shift+P` and type `Remote-SSH: Connect to Host...`
2. Click `+ Add New SSH Host...`
3. Type `YOUR_USERNAME@EXTERNAL_IP` where `YOUR_USERNAME` is your username on the VM and `EXTERNAL_IP` is the external IP of your VM
4. Select the SSH config file you want to save the host to
5. Click `Connect`

You might need to set up SSH keys first. You can do this by running the following command:

```bash
gcloud compute config-ssh
```

This will add the necessary entries to your SSH config file.

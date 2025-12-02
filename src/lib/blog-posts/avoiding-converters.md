---
title: Avoiding converter websites with linux utilities
description: This is a collection of linux utilities that can replace any converter website you need, and can also be used offline
published: '2023-10-17'
tags:
  - linux
  - utilities
---

# Utility list 

Below are the links to the `command-not-found` page, which gives a quick install and usage guide for each of the commands

| command | usage |
|--|--|
|[`jupyter nbconvert`](https://command-not-found.com/jupyter-nbconvert)|Convert jupyter notebooks $\rightarrow$ almost anything|
|[`pandoc`](https://command-not-found.com/pandoc)|Convert almost anything $\rightarrow$ almost anything|
|[`pdfunite`](https://command-not-found.com/pdfunite)|Combine pdfs|

Below are some of the expanded explanations on how to install and use the utility, refer to this if the above websites are insufficient.

If there are anymore utilities which you think are useful then feel free to contact me and I will add them to the list!

## to pdf

### `.ipynb` $\rightarrow$ `.pdf`

[**utility docs link**](https://nbconvert.readthedocs.io/en/latest/usage.html)

If you want just the command, and assuming you have the `jupyter` installed here you go :

```bash
jupyter nbconvert --to FORMAT notebook.ipynb
```

To fully get this working you need to have `jupyter` installed, and to install this you need to have the python package manager pip. To install all of this you should be able to run the following commands: 

```bash
sudo apt install python3
sudo apt install python3-pip
sudo pip3 install --upgrade pip
pip install jupyter
```

**Note** - I tested the install commands only for ubuntu, so they might not work for your distro, but once you have `jupyter` installed it should work all the same.

---

### `.md` / `.txt` $\rightarrow$ `.pdf`

[**utility docs link**](https://pandoc.org/MANUAL.html)

For this one there is a chance you don't have the deps so the command for these is 

```bash
sudo apt install \
  pandoc \
  texlive-latex-base \
  texlive-fonts-recommended \
  texlive-extra-utils \
  texlive-latex-extra \
  texlive-xetex
```

To then convert a markdown or txt file run the following 

```bash 
pandoc txtdoc.txt -o txtdoc.pdf -V geometry:margin=1in
pandoc mddoc.md -o mddoc.pdf -V geometry:margin=1in 
```

The default margin is somewhat absurdly large so thats why I added the additional margin option

**Note** - pandoc actually has alot of different conversions if you need something more specific converted so its a really nice utility to have


## combining pdf

### `.pdf` + `.pdf` $\rightarrow$ `.pdf`

[**utility docs link**](https://manpages.ubuntu.com/manpages/bionic/man1/pdfunite.1.html)

To install pdfunite run the following 

```bash
sudo apt install poppler-utils
```

To then combine pdfs run the following 

```bash
pdfunite pdf1.pdf pdf2.pdf output.pdf
```

# Satellite Sonnet

![Coverage Badge](https://img.shields.io/badge/coverage-99.16%25-brightgreen?style=flat-square)

This repository hosts the frontend code for the Satellite Sonnet project. For the backend code, see [this repository](https://github.com/alexjdean/satellite-sonnet-backend).

This project showcases NASA's astronomy image of the day, along with an LLM-generated Shakespearean sonnet about the image.

Behind the scenes, an AWS Lambda function retrieves the day's image and encodes it as byte blocks in a request to Anthropic's Claude to generate a sonnet. The result is then cached and returned to the frontend (this repository). This occurs every day upon request.

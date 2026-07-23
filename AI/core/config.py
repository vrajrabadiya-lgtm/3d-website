import os

class Config:
    # Google Cloud configurations
    GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "techsodh")
    GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    
    # Check for credentials but we let the SDK handle the actual loading,
    # as long as the environment variable is set.
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    # Model configuration
    PRIMARY_MODEL = os.getenv("PRIMARY_MODEL", "gemini-2.5-flash")

config = Config()

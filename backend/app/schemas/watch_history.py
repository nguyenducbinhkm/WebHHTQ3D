from pydantic import BaseModel

class WatchHistoryCreate(BaseModel):
    movie_id: int
    episode_number: int

from sqlalchemy.orm import Session
from sqlalchemy import text

def get_ranking_movies_db(db: Session):
    query = text("""
        SELECT m.id, m.title, m.slug, m.poster_url, m.backdrop_url, m.status, m.views_count, m.ranking_order
        FROM movies m
        WHERE m.ranking_order IS NOT NULL AND m.ranking_order > 0
        ORDER BY m.ranking_order ASC
        LIMIT 8
    """)
    return db.execute(query).mappings().all()

def get_completed_movies_db(db: Session):
    query = text("""
        SELECT m.id, m.title, m.slug, m.poster_url, m.backdrop_url, m.status, m.views_count
        FROM movies m
        WHERE m.status = 'completed'
        ORDER BY m.views_count DESC
    """)
    return db.execute(query).mappings().all()

def get_top_hot_movies_db(db: Session):
    query = text("""
        SELECT m.id, m.title, m.slug, m.poster_url, m.backdrop_url, m.views_count
        FROM movies m
        ORDER BY m.views_count DESC
        LIMIT 10
    """)
    return db.execute(query).mappings().all()

def get_movies_by_schedule_db(db: Session, day: str):
    query = text("""
        SELECT 
            m.id, m.title, m.slug, m.poster_url, m.backdrop_url, m.status, m.views_count, 
            m.release_day, m.total_ep,
            (SELECT COUNT(*) FROM episodes e WHERE e.movie_id = m.id) AS current_ep
        FROM movies m
        WHERE m.release_day = :day
    """)
    return db.execute(query, {"day": day}).mappings().all()

def search_movies_db(db: Session, search_pattern: str):
    query = text("""
        SELECT m.id, m.title, m.slug, m.poster_url, m.backdrop_url, m.status, m.views_count
        FROM movies m
        WHERE LOWER(m.title) LIKE :q OR LOWER(m.slug) LIKE :q
        ORDER BY m.views_count DESC
        LIMIT 10
    """)
    return db.execute(query, {"q": search_pattern}).mappings().all()

def get_all_movies_with_categories_db(db: Session):
    movies_query = text("""
        SELECT 
            m.id, m.title, m.slug, m.description, m.poster_url, m.backdrop_url, 
            m.status, m.views_count, m.total_ep, m.is_banner, m.ranking_order,
            (SELECT COUNT(*) FROM episodes e WHERE e.movie_id = m.id) AS current_ep
        FROM movies m
        ORDER BY m.created_at DESC
    """)
    movies = db.execute(movies_query).mappings().all()

    result = []
    for movie in movies:
        movie_dict = dict(movie)
        cats_query = text("""
            SELECT c.id, c.name, c.slug
            FROM categories c
            JOIN movie_categories mc ON c.id = mc.category_id
            WHERE mc.movie_id = :movie_id
        """)
        categories = db.execute(cats_query, {"movie_id": movie_dict["id"]}).mappings().all()
        movie_dict["categories"] = [dict(cat) for cat in categories]
        result.append(movie_dict)

    return result

def get_movie_detail_db(db: Session, slug: str):
    movie_query = text("""
        SELECT m.id, m.title, m.slug, m.description, m.poster_url, m.backdrop_url, 
               m.status, m.views_count, m.release_day, m.rating, m.vote_count
        FROM movies m
        WHERE m.slug = :slug
    """)
    movie = db.execute(movie_query, {"slug": slug}).mappings().first()
    
    if not movie:
        return None

    episodes_query = text("""
        SELECT id, episode_number, title, m3u8_url
        FROM episodes
        WHERE movie_id = :movie_id
        ORDER BY episode_number ASC
    """)
    episodes = db.execute(episodes_query, {"movie_id": movie["id"]}).mappings().all()

    categories_query = text("""
        SELECT c.id, c.name, c.slug
        FROM categories c
        JOIN movie_categories mc ON c.id = mc.category_id
        WHERE mc.movie_id = :movie_id
    """)
    categories = db.execute(categories_query, {"movie_id": movie["id"]}).mappings().all()

    return {
        "movie_info": movie,
        "episodes": episodes,
        "categories": categories
    }
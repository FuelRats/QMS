"""Store the game mode in client.odyssey

Revision ID: 3f1c2a7d9b10
Revises: 9525038ca8c4
Create Date: 2026-11-05 17:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3f1c2a7d9b10'
down_revision = '9525038ca8c4'
branch_labels = None
depends_on = None

gamemode = sa.Enum('odyssey', 'horizons3', 'horizons4', name='gamemode')


def upgrade():
    gamemode.create(op.get_bind())
    # Rows stored as false predate Horizons 4.0, so they were Horizons 3.8 clients.
    op.execute(
        "ALTER TABLE client ALTER COLUMN odyssey TYPE gamemode USING "
        "CASE WHEN odyssey THEN 'odyssey'::gamemode "
        "WHEN NOT odyssey THEN 'horizons3'::gamemode END"
    )


def downgrade():
    op.execute(
        "ALTER TABLE client ALTER COLUMN odyssey TYPE boolean USING odyssey = 'odyssey'"
    )
    gamemode.drop(op.get_bind())

"""v2-status

Revision ID: 62d76412f2a0
Revises: 5e1dbce8da69
Create Date: 2024-05-23 12:29:22.307460

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '62d76412f2a0'
down_revision = '5e1dbce8da69'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('instruments', sa.Column('connection', sa.String(length=20), nullable=True))
    op.add_column('instruments', sa.Column('transmission', sa.String(length=20), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('instruments', 'transmission')
    op.drop_column('instruments', 'connection')
    # ### end Alembic commands ###

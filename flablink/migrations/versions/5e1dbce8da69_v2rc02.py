"""v2rc02

Revision ID: 5e1dbce8da69
Revises: 7f0e3a68c2dc
Create Date: 2024-05-20 11:17:39.455796

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '5e1dbce8da69'
down_revision = '7f0e3a68c2dc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    #op.add_column('orders', sa.Column('keyword', sa.String(length=50), nullable=False))
    #op.drop_column('orders', 'keywork')
    op.alter_column('orders', 'keywork', new_column_name='keyword', existing_type=sa.String(length=50))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    # op.add_column('orders', sa.Column('keywork', mysql.VARCHAR(length=50), nullable=False))
    # op.drop_column('orders', 'keyword')
    op.alter_column('orders', 'keyword', new_column_name='keywork')
    # ### end Alembic commands ###

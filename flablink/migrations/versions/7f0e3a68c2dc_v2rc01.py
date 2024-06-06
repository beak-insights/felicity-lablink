"""v2rc01

Revision ID: 7f0e3a68c2dc
Revises: f1db4f15b5f8
Create Date: 2024-05-14 15:03:48.793384

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7f0e3a68c2dc'
down_revision = 'f1db4f15b5f8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('instruments',
    sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('uid', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=30), nullable=True),
    sa.Column('code', sa.String(length=10), nullable=True),
    sa.Column('host', sa.String(length=100), nullable=True),
    sa.Column('port', sa.Integer(), nullable=True),
    sa.Column('path', sa.String(length=20), nullable=True),
    sa.Column('baud_rate', sa.Integer(), nullable=True),
    sa.Column('auto_reconnect', sa.Boolean(), nullable=True),
    sa.Column('connection_type', sa.String(length=10), nullable=True),
    sa.Column('protocol_type', sa.String(length=10), nullable=True),
    sa.Column('socket_type', sa.String(length=10), nullable=True),
    sa.PrimaryKeyConstraint('uid')
    )
    op.create_index(op.f('ix_instruments_uid'), 'instruments', ['uid'], unique=False)
    op.create_table('lims_keywords',
    sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('uid', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('keyword', sa.String(length=50), nullable=True),
    sa.Column('mappings', sa.String(length=255), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('uid'),
    sa.UniqueConstraint('keyword')
    )
    op.create_index(op.f('ix_lims_keywords_uid'), 'lims_keywords', ['uid'], unique=False)
    op.create_table('lims_settings',
    sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('uid', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('address', sa.String(length=100), nullable=True),
    sa.Column('api_url', sa.String(length=100), nullable=True),
    sa.Column('username', sa.String(length=50), nullable=True),
    sa.Column('password', sa.String(length=50), nullable=True),
    sa.Column('max_attempts', sa.Integer(), nullable=True),
    sa.Column('attempt_interval', sa.Integer(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('uid')
    )
    op.create_index(op.f('ix_lims_settings_uid'), 'lims_settings', ['uid'], unique=False)
    op.create_table('link_settings',
    sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('uid', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('verify_results', sa.Boolean(), nullable=True),
    sa.Column('resolve_hologic_eid', sa.Boolean(), nullable=True),
    sa.Column('submission_limit', sa.Integer(), nullable=True),
    sa.Column('sleep_seconds', sa.Integer(), nullable=True),
    sa.Column('sleep_submission_count', sa.Integer(), nullable=True),
    sa.Column('clear_data_over_days', sa.Integer(), nullable=True),
    sa.Column('poll_db_every', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('uid')
    )
    op.create_index(op.f('ix_link_settings_uid'), 'link_settings', ['uid'], unique=False)
    op.create_table('result_exclusions',
    sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('uid', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('result', sa.String(length=100), nullable=True),
    sa.Column('reason', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('uid'),
    sa.UniqueConstraint('result')
    )
    op.create_index(op.f('ix_result_exclusions_uid'), 'result_exclusions', ['uid'], unique=False)
    op.create_table('result_translations',
    sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('uid', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('original', sa.String(length=100), nullable=True),
    sa.Column('translated', sa.String(length=100), nullable=True),
    sa.Column('reason', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('uid'),
    sa.UniqueConstraint('original', 'translated')
    )
    op.create_index(op.f('ix_result_translations_uid'), 'result_translations', ['uid'], unique=False)
    op.add_column('orders', sa.Column('instrument_uid', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'orders', 'instruments', ['instrument_uid'], ['uid'], ondelete='CASCADE')
    op.add_column('raw_data', sa.Column('instrument_uid', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'raw_data', 'instruments', ['instrument_uid'], ['uid'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'raw_data', type_='foreignkey')
    op.drop_column('raw_data', 'instrument_uid')
    op.drop_constraint(None, 'orders', type_='foreignkey')
    op.drop_column('orders', 'instrument_uid')
    op.drop_index(op.f('ix_result_translations_uid'), table_name='result_translations')
    op.drop_table('result_translations')
    op.drop_index(op.f('ix_result_exclusions_uid'), table_name='result_exclusions')
    op.drop_table('result_exclusions')
    op.drop_index(op.f('ix_link_settings_uid'), table_name='link_settings')
    op.drop_table('link_settings')
    op.drop_index(op.f('ix_lims_settings_uid'), table_name='lims_settings')
    op.drop_table('lims_settings')
    op.drop_index(op.f('ix_lims_keywords_uid'), table_name='lims_keywords')
    op.drop_table('lims_keywords')
    op.drop_index(op.f('ix_instruments_uid'), table_name='instruments')
    op.drop_table('instruments')
    # ### end Alembic commands ###

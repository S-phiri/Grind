"""
Streamlit Performance Analytics Dashboard
Analyzes strength vs speed correlation from Grind training data
"""
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import sqlite3
import numpy as np
from scipy.stats import pearsonr
import os

# Page config
st.set_page_config(
    page_title="Performance Alpha: Strength vs Speed",
    page_icon="📊",
    layout="wide"
)

st.title("📊 Performance Alpha: Strength vs Speed")
st.markdown("---")

# Database path
db_path = os.path.join("backend", "db.sqlite3")

if not os.path.exists(db_path):
    st.error(f"Database not found at {db_path}. Please ensure the Django backend has been run and migrations applied.")
    st.stop()

try:
    # Connect to database
    conn = sqlite3.connect(db_path)
    
    # Query for Squat 1RM metrics
    squat_query = """
    SELECT 
        p.id as player_id,
        p.name as player_name,
        m.value as squat_1rm,
        m.date as metric_date
    FROM api_metric m
    JOIN api_player p ON m.player_id = p.id
    WHERE m.metric_type LIKE '%Squat%1RM%' 
       OR m.metric_type LIKE '%1RM%Squat%'
       OR m.metric_type LIKE '%Back Squat%'
       OR (m.metric_type LIKE '%Squat%' AND m.unit = 'kg')
    ORDER BY p.id, m.date DESC
    """
    
    # Query for 20m Sprint Time metrics
    sprint_query = """
    SELECT 
        p.id as player_id,
        p.name as player_name,
        m.value as sprint_20m,
        m.date as metric_date
    FROM api_metric m
    JOIN api_player p ON m.player_id = p.id
    WHERE m.metric_type LIKE '%20m%Sprint%'
       OR m.metric_type LIKE '%Sprint%20m%'
       OR (m.metric_type LIKE '%Sprint%' AND m.unit = 's')
    ORDER BY p.id, m.date DESC
    """
    
    # Load data
    squat_df = pd.read_sql_query(squat_query, conn)
    sprint_df = pd.read_sql_query(sprint_query, conn)
    
    conn.close()
    
    if squat_df.empty and sprint_df.empty:
        st.warning("No data found. Please add metrics to the database first.")
        st.info("""
        **To add test data:**
        1. Go to Django admin or use the API
        2. Create players
        3. Add metrics with types like:
           - "Squat 1RM" or "Back Squat" (in kg)
           - "20m Sprint Time" or "Sprint 20m" (in seconds)
        """)
        st.stop()
    
    # Process data - get latest metric per player
    if not squat_df.empty:
        squat_latest = squat_df.groupby('player_id').first().reset_index()
    else:
        squat_latest = pd.DataFrame(columns=['player_id', 'player_name', 'squat_1rm'])
    
    if not sprint_df.empty:
        sprint_latest = sprint_df.groupby('player_id').first().reset_index()
    else:
        sprint_latest = pd.DataFrame(columns=['player_id', 'player_name', 'sprint_20m'])
    
    # Merge on player_id
    merged_df = pd.merge(
        squat_latest[['player_id', 'player_name', 'squat_1rm']],
        sprint_latest[['player_id', 'sprint_20m']],
        on='player_id',
        how='inner'
    )
    
    if merged_df.empty:
        st.warning("No players found with both Squat 1RM and 20m Sprint metrics.")
        st.info("""
        **Data Requirements:**
        - Players need both Squat 1RM (kg) and 20m Sprint Time (s) metrics
        - Metric types should contain "Squat" and "20m" or "Sprint"
        """)
        
        # Show available data
        col1, col2 = st.columns(2)
        with col1:
            if not squat_df.empty:
                st.write("**Squat 1RM Data:**")
                st.dataframe(squat_latest[['player_name', 'squat_1rm']], use_container_width=True)
        with col2:
            if not sprint_df.empty:
                st.write("**20m Sprint Data:**")
                st.dataframe(sprint_latest[['player_name', 'sprint_20m']], use_container_width=True)
        st.stop()
    
    # Remove any NaN values
    merged_df = merged_df.dropna()
    
    if len(merged_df) < 2:
        st.warning("Need at least 2 players with both metrics to calculate correlation.")
        st.dataframe(merged_df, use_container_width=True)
        st.stop()
    
    # Display data summary
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Players Analyzed", len(merged_df))
    with col2:
        st.metric("Avg Squat 1RM", f"{merged_df['squat_1rm'].mean():.1f} kg")
    with col3:
        st.metric("Avg 20m Sprint", f"{merged_df['sprint_20m'].mean():.2f} s")
    
    st.markdown("---")
    
    # Calculate correlation
    correlation, p_value = pearsonr(merged_df['squat_1rm'], merged_df['sprint_20m'])
    
    # Create scatter plot
    fig, ax = plt.subplots(figsize=(10, 6))
    
    scatter = ax.scatter(
        merged_df['squat_1rm'],
        merged_df['sprint_20m'],
        s=100,
        alpha=0.6,
        c=merged_df['squat_1rm'],
        cmap='viridis',
        edgecolors='white',
        linewidth=2
    )
    
    # Add player labels
    for idx, row in merged_df.iterrows():
        ax.annotate(
            row['player_name'],
            (row['squat_1rm'], row['sprint_20m']),
            xytext=(5, 5),
            textcoords='offset points',
            fontsize=9,
            alpha=0.7
        )
    
    # Add trend line
    z = np.polyfit(merged_df['squat_1rm'], merged_df['sprint_20m'], 1)
    p = np.poly1d(z)
    ax.plot(
        merged_df['squat_1rm'],
        p(merged_df['squat_1rm']),
        "r--",
        alpha=0.5,
        linewidth=2,
        label=f'Trend (r={correlation:.3f})'
    )
    
    ax.set_xlabel('Squat 1RM (kg)', fontsize=12, fontweight='bold')
    ax.set_ylabel('20m Sprint Time (s)', fontsize=12, fontweight='bold')
    ax.set_title('Performance Alpha: Strength vs Speed', fontsize=16, fontweight='bold', pad=20)
    ax.grid(True, alpha=0.3)
    ax.legend()
    
    plt.colorbar(scatter, ax=ax, label='Squat 1RM (kg)')
    plt.tight_layout()
    
    st.pyplot(fig)
    
    # Display correlation stats
    st.markdown("---")
    col1, col2 = st.columns(2)
    
    with col1:
        st.metric(
            "Correlation Coefficient (Pearson r)",
            f"{correlation:.3f}",
            help="Range: -1 to +1. Negative means stronger athletes sprint faster."
        )
    
    with col2:
        significance = "Significant" if p_value < 0.05 else "Not Significant"
        st.metric(
            "Statistical Significance",
            significance,
            f"p = {p_value:.4f}",
            help="p < 0.05 indicates statistical significance"
        )
    
    # Interpretation
    st.markdown("### 📈 Interpretation")
    if correlation < -0.5:
        st.success("**Strong negative correlation**: Higher squat strength is associated with faster sprint times. This suggests strength training is beneficial for speed performance.")
    elif correlation < -0.3:
        st.info("**Moderate negative correlation**: Some relationship between strength and speed, but other factors may be important.")
    elif correlation < 0.3:
        st.warning("**Weak correlation**: Little relationship between these specific metrics. Consider other factors or different metric combinations.")
    else:
        st.error("**Positive correlation**: Unexpected result - stronger athletes are slower. Review data quality or consider confounding factors.")
    
    # Data table
    with st.expander("View Raw Data"):
        st.dataframe(
            merged_df[['player_name', 'squat_1rm', 'sprint_20m']].sort_values('squat_1rm', ascending=False),
            use_container_width=True
        )

except sqlite3.Error as e:
    st.error(f"Database error: {str(e)}")
except Exception as e:
    st.error(f"Error: {str(e)}")
    import traceback
    with st.expander("Error Details"):
        st.code(traceback.format_exc())

